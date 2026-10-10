/* R2, R7, R8, R9: interest-check "Noticed" items over the real `people` (its R22–R25), on people's own test world. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, ANN } from "../people/fixture.mjs";
import { producers, fresh, reader, ofKind, sentences, texts, JUDGMENT, snapshot, hintFailures } from "./fixture.mjs";
import { TAKE_UP, NOTICED_LABEL, HINT_MARK } from "../../../src/notice-producers/index.mjs";

const NOW = "2026-10-06T12:00:00Z";
const span = (from, to) => ({ from, to });
const BOSS = "member:boss";

/* The revolving door the shipped check finds: a government post overseeing a company, then a post at the company. */
function door(w, { fenced = false } = {}) {
  const office = w.entity("office", "Harbour Commissioner"), co = w.entity("institution", "Quay Ltd");
  const p = w.person("Uma Vance");
  w.line("holds", p, office, span("2010-01-01", "2015-12-31"));
  w.line("holds", p, co, span("2016-06-01", "2018-01-01"), { fenced });
  w.line("oversees", office, co, span("2000-01-01", "2030-01-01"));
  return { p };
}
const shipped = (w) => w.p.listChecks({ viewer: ANN }).checks.find((c) => c.machine && c.name === "revolving door");
const gate = (w, rate) => w.p.recordCheckGate({ check: shipped(w).check, version: 1, goldSet: "desk gold set", falseAlarmRate: rate, by: BOSS });
const join = (w, project, member) => w.st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated)
  VALUES (?,?,?,?,?)`, project, member, "joined", NOW, NOW);
function setup({ fenced = false } = {}) {
  const w = world();
  const d = door(w, { fenced });
  const P = w.project();                       /* owned by ann; out is no participant */
  w.p.evaluateChecks({ budgetMs: 10_000 });
  const n = producers(w.host, { membership: w.membership, people: w.p, duties: w.duties });
  return { w, d, P, ...reader(n), n };
}

test("R2 R9: a closed gate raises no item and counts none; once the gate is recorded at or under 20% each result is one FINDING interest-check-noticed, keyed by check and result", () => {
  const { w, read } = setup();
  const closed = read("ann", { now: NOW });
  assert.deepEqual(ofKind(closed, "interest-check-noticed"), []);
  assert.ok(!texts(closed.facts).some((t) => /count/.test(t)), "no count of a closed gate's results");
  gate(w, 0.21);
  assert.deepEqual(ofKind(read("ann", { now: NOW }), "interest-check-noticed"), [], "above 20% stays closed");
  gate(w, 0.2);
  const r = read("ann", { now: NOW });
  const items = ofKind(r, "interest-check-noticed");
  assert.equal(items.length, 1);
  const results = w.p.checkResults({ viewer: ANN }).checks[0].results;
  const it = items[0];
  assert.equal(it.id, `FINDING::interest-check-noticed::${shipped(w).check}::${results[0].result_id}`);
  assert.equal(it.class, "FINDING");
  assert.equal(it.label, NOTICED_LABEL);
  assert.equal(it.layer, "hypothesis");
  assert.equal(it.by, "the machine's");
  assert.deepEqual(it.recipients, ["ann"]);
});

test("R2: the detail states the check's data-defined condition, its denominator and its cited derivation; the subject is the pattern, never the person; no judgment of a person", () => {
  const { w, read } = setup();
  gate(w, 0.1);
  const it = ofKind(read("ann", { now: NOW }), "interest-check-noticed")[0];
  assert.deepEqual(it.basis.condition, shipped(w).condition);
  assert.ok(it.detail.includes(JSON.stringify(shipped(w).condition)), "the condition, stated in the detail");
  assert.equal(it.basis.denominator.label, shipped(w).denominator);
  assert.match(it.detail, new RegExp(shipped(w).denominator));
  assert.ok(Array.isArray(it.basis.derivation.rows) && it.basis.derivation.rows.length === 3, "every row it rests on");
  assert.equal(it.subject.kind, "interest_check_result");
  assert.notEqual(it.subject.kind, "person");
  for (const s of sentences(it)) assert.doesNotMatch(s, JUDGMENT, s);
  assert.ok(!texts(it).some((t) => /suspic|conflict/i.test(t)));
});

test("R2 R7: only to members of the project the check runs in who may see every input; a hidden input withholds the result from them; nobody else", () => {
  const { w, P, read } = setup({ fenced: true });
  gate(w, 0.1);
  /* ann sees the fenced line (her project's); out joins another project, from which that line is hidden */
  assert.equal(ofKind(read("ann", { now: NOW }), "interest-check-noticed").length, 1);
  const Q = w.dw.project("out");
  assert.ok(Q);
  const outRead = read("out", { now: NOW });
  assert.deepEqual(ofKind(outRead, "interest-check-noticed"), [], "a result resting on a row out may not see");
  assert.ok(!texts(outRead).some((t) => t.includes(P)), "nothing names the hidden project");
  /* the control: with no fenced row, out's own project receives the same group-wide result */
  const open = setup();
  gate(open.w, 0.1);
  open.w.dw.project("out");
  assert.equal(ofKind(open.read("out", { now: NOW }), "interest-check-noticed").length, 1);
  /* boss participates in nothing: no item */
  assert.deepEqual(ofKind(read("boss", { now: NOW }), "interest-check-noticed"), []);
  /* a machine credential, and no member at all, receive none */
  assert.deepEqual(read(null).items, []);
  assert.deepEqual(read("class:daemon", { viewer: "class:daemon" }).items, []);
});

test("R2: switched off for a project, a check raises nothing there; a group-wide check reaches each project of the member's that has not switched it off, one item homed under each", () => {
  const { w, P, read } = setup();
  gate(w, 0.1);
  const Q = w.dw.project("ann");
  const it = ofKind(read("ann", { now: NOW }), "interest-check-noticed")[0];
  assert.deepEqual(it.basis.projects, [P, Q].sort());
  assert.deepEqual(it.case.ancestors.map((a) => a.id).sort(), [P, Q].sort());
  w.p.switchCheck({ check: shipped(w).check, project: P, on: false, by: ANN });
  assert.deepEqual(ofKind(read("ann", { now: NOW }), "interest-check-noticed")[0].basis.projects, [Q]);
  w.p.switchCheck({ check: shipped(w).check, project: Q, on: false, by: ANN });
  assert.deepEqual(ofKind(read("ann", { now: NOW }), "interest-check-noticed"), []);
  /* a member joined only to the switched-off project gets none */
  join(w, P, "out");
  assert.deepEqual(ofKind(read("out", { now: NOW }), "interest-check-noticed"), []);
});

test("R2: raised once; it leaves when the result no longer holds (the read no longer answers it)", () => {
  const { w, read } = setup();
  gate(w, 0.1);
  const a = ofKind(read("ann", { now: NOW }), "interest-check-noticed");
  const b = ofKind(read("ann", { now: NOW }), "interest-check-noticed");
  assert.deepEqual(a.map((i) => i.id), b.map((i) => i.id), "one item per result, the same key on every read");
  /* a new version of the check is ungated until its own rate is recorded: its old version's results no longer answer */
  w.p.defineCheck({ check: shipped(w).check, name: "revolving door", condition: shipped(w).condition, denominator: "a new set", by: ANN });
  assert.deepEqual(ofKind(read("ann", { now: NOW }), "interest-check-noticed"), []);
});

test("R8: an interest-check item offers only taking it up as a hunch or hypothesis; it is never a citation; the read stores nothing on a person or anywhere", () => {
  const { w, read } = setup();
  gate(w, 0.1);
  const before = snapshot((q) => w.st.sql.exec(q));
  const it = ofKind(read("ann", { now: NOW }), "interest-check-noticed")[0];
  assert.deepEqual(snapshot((q) => w.st.sql.exec(q)), before, "nothing written");
  assert.deepEqual(it.options, [TAKE_UP]);
  assert.ok(!it.options.some((o) => /cite|grade|finding|conclude/i.test(o.id)));
  assert.equal(it.basis.gate, "open");
});

test("R9: the gate is the only switch: no parameter of the read shows a gated check", () => {
  const { read } = setup();
  for (const extra of [{}, { now: NOW }]) assert.deepEqual(ofKind(read("ann", extra), "interest-check-noticed"), []);
});

test("R9: a second guard: a check whose answer does not say its gate is open raises nothing", () => {
  const w = world();
  const P = w.project();
  const n = producers(w.host, { membership: w.membership, people: {
    listChecks: () => ({ ok: true, checks: [] }),
    checkResults: () => ({ ok: true, checks: [
      { check: "CHK-2026-0009", version: 1, name: "x", gated: true, results: [{ result_id: "r1", at: NOW }] },
      { check: "CHK-2026-0010", version: 1, name: "y", results: [{ result_id: "r2", at: NOW }] }] }) } });
  assert.ok(P);
  assert.deepEqual(ofKind(reader(n).read("ann", { now: NOW }), "interest-check-noticed"), []);
});

test("R11: an interest-check item is marked \"Hint · machine work\" in its summary and detail, every sentence calls it a hint and none a signal; its label, kind and key unchanged", () => {
  const { w, read } = setup();
  gate(w, 0.1);
  assert.equal(HINT_MARK, "Hint · machine work");
  const it = ofKind(read("ann", { now: NOW }), "interest-check-noticed")[0];
  assert.deepEqual(hintFailures(it, HINT_MARK), []);
  assert.equal(it.summary, `Hint · machine work: a pattern the check "revolving door" finds in held facts`);
  assert.equal(it.options[0].label, "Take this hint up as your own hunch or hypothesis");
  assert.equal(it.label, "noticed");
  assert.equal(it.kind, "interest-check-noticed");
  assert.match(it.id, /^FINDING::interest-check-noticed::CHK-[^:]+::[^:]+$/);
});

test("R2 R7 (D54; N822, K2408): an administrator at a hidden project's EXISTENCE is told nothing of its contents: no interest-check item for that project, which is never asked about for them; the control: joined, the same administrator receives it", () => {
  const { w, P } = setup();
  gate(w, 0.1);
  const asked = [];
  const people = { listChecks: (a) => w.p.listChecks(a), checkResults: (a) => { asked.push([a.viewer, a.project]); return w.p.checkResults(a); } };
  const read = (m) => reader(fresh(w.host, { membership: w.membership, people, duties: w.duties })).read(m, { now: NOW });
  assert.equal(w.membership.sight(P, BOSS), "existence", "boss, an administrator, sees only that the hidden project exists");
  const r = read("boss");
  assert.deepEqual(ofKind(r, "interest-check-noticed"), []);
  assert.deepEqual(asked.filter(([, p]) => p === P), [], "the hidden project is never asked about for him");
  assert.ok(!texts(r).some((t) => t.includes(P)), "nothing names it");
  join(w, P, "boss");
  assert.equal(ofKind(read("boss"), "interest-check-noticed").length, 1, "negative control: joined, he receives it");
});
