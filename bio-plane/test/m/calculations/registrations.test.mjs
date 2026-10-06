/* calculations: the registrations it fills (R19, R20) and the machine's patterns (R22, R23). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, R } from "./fixture.mjs";
import { PATTERNS, GATE_MAX_RATE } from "../../../src/calculations/index.mjs";

const code = (r) => (r && r.ok === false ? r.reason : "ok");
const PERIOD = { from: "2025-07-01", to: "2026-06-30" };

test("R19 at start it registers with duties.registerOccurrenceEvidence; asked {duty, occurrence}, an accepted calculation naming that occurrence in evidences is answered as its evidence with its results and grade facts; a stale or withheld one is answered as such", async () => {
  const w = seeded();
  assert.deepEqual(w.duties.evidence.map((e) => e.module), ["calculations"], "registered once, at start");
  const ask = w.duties.evidence[0].fn;
  const t = await w.table("days\n12\n", [{ name: "days", type: "integer" }]);
  const sumDays = R([{ op: "sum", from: "t", field: "days", as: "s" }], "s");
  const ev = [{ duty: "DUT-2026-0001", occurrence: "occ-1" }];
  const c = await w.c.create({ question: "Days to post the minutes?", period: PERIOD, kind: "span", inputs: [{ name: "t", table: t.sha }], recipe: sumDays, evidences: ev, by: V("bob") });
  assert.deepEqual(await ask({ duty: "DUT-2026-0001", occurrence: "occ-1" }), [], "not yet accepted: no evidence");
  await w.c.accept({ calcId: c.calc_id, by: V("carol") });
  const got = await ask({ duty: { duty_id: "DUT-2026-0001" }, occurrence: { key: "occ-1" } });
  assert.equal(got.length, 1);
  assert.equal(got[0].calc_id, c.calc_id);
  assert.equal(got[0].results.output.value, "12");
  assert.equal(got[0].grade.grade, "B");
  assert.equal(got[0].state, "current");
  assert.deepEqual(await ask({ duty: "DUT-2026-0001", occurrence: "occ-2" }), [], "another occurrence");
  /* stale */
  const f = w.money.add({ amount: "3" });
  const m = await w.c.create({ question: "Q", period: PERIOD, kind: "total", inputs: [{ name: "t", money: [f] }], recipe: R([{ op: "sum", from: "t", field: "amount", as: "s" }], "s"), evidences: [{ duty: "DUT-2026-0002", occurrence: "o" }], by: V("bob") });
  await w.c.accept({ calcId: m.calc_id, by: V("carol") });
  w.money.change(f, "adjusted");
  assert.equal((await ask({ duty: "DUT-2026-0002", occurrence: "o" }))[0].state, "stale");
  /* withheld from a viewer who may not see an input */
  const P = w.project("Closed", "alice");
  const hidden = await w.table("days\n4\n", [{ name: "days", type: "integer" }], { by: V("alice") }, { project: P });
  const h = await w.c.create({ question: "Q", period: PERIOD, kind: "span", inputs: [{ name: "t", table: hidden.sha }], recipe: sumDays, evidences: [{ duty: "DUT-2026-0003", occurrence: "o" }], by: V("alice") });
  await w.c.accept({ calcId: h.calc_id, by: V("alice") });
  const seen = await ask({ duty: "DUT-2026-0003", occurrence: "o", viewer: V("carol") });
  assert.deepEqual(seen, [{ withheld: true, says: seen[0].says }]);
  assert.equal("results" in seen[0], false, "withheld whole");
  assert.equal((await ask({ duty: "DUT-2026-0003", occurrence: "o", viewer: V("alice") }))[0].calc_id, h.calc_id);
});

test("R20 at start it registers with people.registerRosterSource: for an organisation and a date it answers the rows of tables with roster roles valid at that date, by person key, with the table's sha, and reads no row into a line", async () => {
  const w = seeded();
  assert.deepEqual(w.people.sources.map((s) => s.module), ["calculations"]);
  const source = w.people.sources[0].fn;
  const fields = [{ name: "person", type: "string" }, { name: "org", type: "string" }, { name: "post", type: "string" }];
  const roles = { person: { role: "roster_person", space: "person" }, org: { role: "roster_organisation", scheme: "org_code" }, post: { role: "roster_post" } };
  w.entities.set("org_code", "PW", "ENT-2026-0100");
  w.entities.set("org_code", "LIB", "ENT-2026-0200");
  const a = await w.table("person,org,post\nP001,PW,Director\nP002,LIB,Librarian\nP003,PW,Engineer\nP004,??,Clerk\n", fields, { roles, vintage: { key: "roster", valid: { from: "2025-01-01", to: "2025-12-31" } } });
  const b = await w.table("person,org,post\nP009,PW,Director\n", fields, { roles, vintage: { key: "roster", valid: { from: "2026-01-01", to: "2026-12-31" } } });
  const c = await w.table("person,org,post\nP010,PW,Intern\n", fields, { roles });
  const lines = w.count("calc_tables");
  const r = await source({ organisation: "ENT-2026-0100", at: "2025-06-01", viewer: V("carol") });
  assert.deepEqual(r.rows.map((x) => [x.person_key, x.post, x.table]), [["P001", "Director", a.sha], ["P003", "Engineer", a.sha]]);
  assert.deepEqual(r.tables, [a.sha], "the table valid at that date, by its sha; the later vintage is not read");
  assert.ok(r.not_read.some((x) => x.table === c.sha && /no vintage/.test(x.why)), "a table stating no vintage is not read, and says why");
  assert.ok(r.not_read.some((x) => x.table === a.sha && x.row === 3), "an organisation value that resolves to none is stated");
  assert.equal((await source({ organisation: "ENT-2026-0100", at: "2026-03-01" })).rows[0].table, b.sha);
  assert.equal(w.count("calc_tables"), lines, "no row is read into a line, nor anything written");
  assert.match(r.says, /never copied into lines/);
});

/* The duty fixture the lateness patterns read: three occurrences of the clerk's duty, one met late by 5 days. */
function lateness(w) {
  w.duties.duties.set("DUT-2026-0001", { duty_id: "DUT-2026-0001", obligor: "ENT-2026-0050", arising_in: "ENT-2026-0900" });
  w.duties.duties.set("DUT-2026-0002", { duty_id: "DUT-2026-0002", obligor: "ENT-2026-0050", arising_in: null, visibleTo: [V("alice")] });
  w.duties.transitions.push(
    { duty_id: "DUT-2026-0001", occurrence_key: "a", state: "met_late", as_of: "2026-01-20", at: "2026-01-20T00:00:00Z" },
    { duty_id: "DUT-2026-0001", occurrence_key: "b", state: "met", as_of: "2026-02-20", at: "2026-02-20T00:00:00Z" },
    { duty_id: "DUT-2026-0002", occurrence_key: "c", state: "met", as_of: "2026-03-20", at: "2026-03-20T00:00:00Z" },
    { duty_id: "DUT-2026-0002", occurrence_key: "d", state: "overdue", as_of: "2026-03-20", at: "2026-03-20T00:00:00Z" });
  w.duties.occurrences.set("DUT-2026-0001", [{ key: "a", due: { due: { value: "2026-01-10", precision: "day", zone: "UTC" } }, evidence: [{ event_id: "EVT-2026-aaaaaaaaaaaaaaaa", when: { value: "2026-01-15", precision: "day", zone: "UTC" } }] }]);
  w.events.events.set("EVT-2026-aaaaaaaaaaaaaaaa", { event_id: "EVT-2026-aaaaaaaaaaaaaaaa", kind: "meeting", body: "ENT-2026-0050", when: { start: "2026-01-15T18:00", precision: "minute", zone: "UTC" },
    relations: [{ kind: "within", from: "EVT-2026-bbbbbbbbbbbbbbbb", to: "EVT-2026-aaaaaaaaaaaaaaaa" }] });
  w.events.events.set("EVT-2026-bbbbbbbbbbbbbbbb", { event_id: "EVT-2026-bbbbbbbbbbbbbbbb", kind: "publication", body: "ENT-2026-0050", when: { start: "2026-01-13T09:00", precision: "minute", zone: "UTC" } });
  w.progressions.feed.instances = [
    { progression_key: "contracting", entity_id: "ENT-2026-0300", findings: [{ kind: "out_of_order", stage_key: "payment", after_stage: "award", placements: [{ bundle_id: null }] }] },
    { progression_key: "contracting", entity_id: "ENT-2026-0301", findings: [{ kind: "missing_predecessor", stage_key: "award" }] },
  ];
}

test("R22 the shipped, data-defined patterns (sequence anomalies, lateness per occurrence and per meeting's posting, and patterns about an office and across proceedings) each carry a denominator and cited derivation; runPatterns evaluates them within the budget into their own result table, never onto a person or entity row, and answers {evaluated, remaining}", async () => {
  const w = seeded();
  lateness(w);
  assert.deepEqual(PATTERNS.map((p) => p.pattern), ["flow_out_of_order", "duty_lateness", "posting_lateness", "office_lateness", "proceeding_lateness"]);
  for (const p of PATTERNS) assert.ok(p.denominator && p.method && p.label && Number.isInteger(p.version), p.pattern);
  /* a budget that runs out: one pattern per call when the clock moves past it */
  let calls = 0;
  const before = w.snapshot();
  const first = await w.c.runPatterns({ budgetMs: 1 });
  calls++;
  assert.equal(first.ok, true);
  assert.ok(first.evaluated >= 1);
  let last = first;
  while (last.remaining) { w.clock.ms += 10; last = await w.c.runPatterns({ budgetMs: 1 }); calls++; assert.ok(calls < 20); }
  assert.equal(last.remaining, false);
  const after = w.snapshot();
  for (const k of Object.keys(after)) if (!k.startsWith("calc_pattern")) assert.deepEqual(after[k], before[k], `${k}: no person, entity or other row written`);
  const res = w.rows(`SELECT * FROM calc_pattern_results ORDER BY pattern, result_key`);
  const of = (p) => res.filter((r) => r.pattern === p).map((r) => ({ subject: r.subject, value: JSON.parse(r.value_json), d: JSON.parse(r.denominator_json), der: JSON.parse(r.derivation_json), rests: JSON.parse(r.rests_on_json) }));
  const flow = of("flow_out_of_order");
  assert.equal(flow.length, 1);
  assert.equal(flow[0].subject, "ENT-2026-0300");
  assert.equal(flow[0].d.n, 2, "the denominator: the instances read");
  assert.equal(flow[0].d.share_out_of_order.denominator.value, "2");
  const late = of("duty_lateness");
  assert.equal(late.length, 1);
  assert.deepEqual(late[0].value.days_late, { value: "5", sign: "+", precision: "exact", unit: "days" }, "days late, through calc-grammar's span");
  assert.equal(late[0].d.n, 3, "over the occurrences recorded met or met late");
  assert.deepEqual(late[0].rests, ["DUT-2026-0001", "EVT-2026-aaaaaaaaaaaaaaaa"], "its cited derivation");
  const posting = of("posting_lateness");
  assert.equal(posting.length, 1);
  assert.equal(posting[0].value.hours_before.value, "57");
  const office = of("office_lateness");
  assert.deepEqual(office.map((o) => [o.subject, o.value.share_met_late.numerator.value, o.value.share_met_late.denominator.value]), [["ENT-2026-0050", "1", "3"]]);
  const proc = of("proceeding_lateness");
  assert.deepEqual(proc.map((o) => [o.subject, o.value.share_met_late.numerator.value, o.value.share_met_late.denominator.value]), [["ENT-2026-0900", "1", "2"]]);
  /* every run is recorded with its denominator */
  assert.equal(new Set(w.rows(`SELECT pattern FROM calc_pattern_runs`).map((r) => r.pattern)).size, 5);
});

test("R23 a pattern's results are answered only once its gate is recorded at a false-alarm rate of at most 20% by an administrator; until then {gated: true, reason}; each result is the machine's, layer hypothesis, Noticed, switchable off per project; onPatternResult tells notice-producers once per new result; a result resting on a row the viewer may not see is withheld whole and not counted", async () => {
  const w = seeded();
  lateness(w);
  const told = [];
  assert.equal(code(w.c.onPatternResult("", () => {})), "LISTENER_MALFORMED");
  assert.equal(w.c.onPatternResult("notice-producers", (r) => told.push(r)).ok, true);
  assert.equal(code(w.c.onPatternResult("notice-producers", () => {})), "LISTENER_DECLARED");
  await w.c.runPatterns({ budgetMs: 100000 });
  const gated = await w.c.patternResults({ pattern: "office_lateness", viewer: V("alice") });
  assert.equal(gated.patterns[0].gated, true);
  assert.match(gated.patterns[0].reason, /not been measured/);
  assert.equal("results" in gated.patterns[0], false);
  assert.equal(told.length, 0, "nothing is told before the gate opens");
  /* the gate: an administrator's act, with its refusals */
  assert.equal(code(await w.c.recordPatternGate({ pattern: "office_lateness", goldSet: "desk-2026", falseAlarmRate: 0.1, by: V("bob") })), "NOT_AN_ADMIN");
  assert.equal(code(await w.c.recordPatternGate({ pattern: "office_lateness", goldSet: "desk-2026", falseAlarmRate: 0.1, by: MACHINE })), "NOT_AN_ADMIN");
  assert.equal(code(await w.c.recordPatternGate({ pattern: "verdicts", goldSet: "g", falseAlarmRate: 0.1, by: V("alice") })), "NO_SUCH_PATTERN");
  assert.equal(code(await w.c.recordPatternGate({ pattern: "office_lateness", goldSet: " ", falseAlarmRate: 0.1, by: V("alice") })), "NO_GOLD_SET");
  for (const rate of [-0.1, 1.5, "x", null]) assert.equal(code(await w.c.recordPatternGate({ pattern: "office_lateness", goldSet: "g", falseAlarmRate: rate, by: V("alice") })), "BAD_RATE", String(rate));
  const high = await w.c.recordPatternGate({ pattern: "office_lateness", goldSet: "desk-2026", falseAlarmRate: 0.25, by: V("alice") });
  assert.equal(high.open, false, "above 20%: still gated");
  assert.equal((await w.c.patternResults({ pattern: "office_lateness", viewer: V("alice") })).patterns[0].gated, true);
  assert.equal(GATE_MAX_RATE, 0.2);
  const open = await w.c.recordPatternGate({ pattern: "office_lateness", goldSet: "desk-2026", falseAlarmRate: 0.2, by: V("alice") });
  assert.equal(open.open, true, "at 20%: shown");
  assert.equal(told.length, 1, "told once of the new result");
  assert.equal(told[0].layer, "hypothesis");
  await w.c.runPatterns({ budgetMs: 100000 });
  assert.equal(told.length, 1, "a result already told is not told again");
  const shown = (await w.c.patternResults({ pattern: "office_lateness", viewer: V("alice") })).patterns[0];
  assert.equal(shown.gated, false);
  assert.equal(shown.count, 1);
  const r = shown.results[0];
  assert.deepEqual({ layer: r.layer, label: r.label, by: r.by }, { layer: "hypothesis", label: "Noticed", by: "the machine" });
  assert.ok(r.denominator && r.derivation);
  /* a result resting on a duty carol may not see is withheld whole and not counted */
  const forCarol = (await w.c.patternResults({ pattern: "office_lateness", viewer: V("carol") })).patterns[0];
  assert.equal(forCarol.count, 0);
  assert.deepEqual(forCarol.results, []);
  /* switched off per project by a member of it */
  const P = w.project("Clerk watch", "bob");
  assert.equal(code(w.c.switchPattern({ pattern: "office_lateness", project: P, on: false, by: V("carol") })), "NO_SUCH_PROJECT", "a project carol cannot see");
  assert.equal(code(w.c.switchPattern({ pattern: "office_lateness", project: P, on: false, by: MACHINE })), "MEMBER_ACT_ONLY");
  assert.equal(code(w.c.switchPattern({ pattern: "office_lateness", project: P, on: "no", by: V("bob") })), "BAD_SWITCH");
  assert.equal(w.c.switchPattern({ pattern: "office_lateness", project: P, on: false, by: V("bob") }).ok, true);
  assert.equal((await w.c.patternResults({ pattern: "office_lateness", project: P, viewer: V("alice") })).patterns[0].switched_off, true);
  assert.equal((await w.c.patternResults({ pattern: "office_lateness", viewer: V("alice") })).patterns[0].count, 1, "on elsewhere");
  w.c.switchPattern({ pattern: "office_lateness", project: P, on: true, by: V("bob") });
  assert.equal((await w.c.patternResults({ pattern: "office_lateness", project: P, viewer: V("alice") })).patterns[0].count, 1);
  /* the other patterns stay gated */
  const all = (await w.c.patternResults({ viewer: V("alice") })).patterns;
  assert.deepEqual(all.filter((p) => p.gated).map((p) => p.pattern), ["flow_out_of_order", "duty_lateness", "posting_lateness", "proceeding_lateness"]);
});
